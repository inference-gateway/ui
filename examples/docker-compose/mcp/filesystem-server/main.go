package main

// Keeping this file as a simple example that you could write the mcp server in any language.

import (
	"context"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	mcp_golang "github.com/metoro-io/mcp-golang"
	"github.com/metoro-io/mcp-golang/transport/http"
)

// FileWriteArgs defines the arguments for writing to a file
type FileWriteArgs struct {
	Path    string `json:"path" jsonschema:"description=The file path to write to"`
	Content string `json:"content" jsonschema:"description=The content to write to the file"`
	Mode    string `json:"mode,omitempty" jsonschema:"description=Write mode: 'overwrite' (default) or 'append'"`
}

// FileReadArgs defines the arguments for reading from a file
type FileReadArgs struct {
	Path string `json:"path" jsonschema:"description=The file path to read from"`
}

// FileDeleteArgs defines the arguments for deleting a file
type FileDeleteArgs struct {
	Path string `json:"path" jsonschema:"description=The file path to delete"`
}

// DirectoryListArgs defines the arguments for listing directory contents
type DirectoryListArgs struct {
	Path      string `json:"path" jsonschema:"description=The directory path to list"`
	Recursive bool   `json:"recursive,omitempty" jsonschema:"description=Whether to list recursively (default: false)"`
}

// DirectoryCreateArgs defines the arguments for creating a directory
type DirectoryCreateArgs struct {
	Path string `json:"path" jsonschema:"description=The directory path to create"`
}

// FileExistsArgs defines the arguments for checking if a file exists
type FileExistsArgs struct {
	Path string `json:"path" jsonschema:"description=The file path to check"`
}

// FileInfoArgs defines the arguments for getting file information
type FileInfoArgs struct {
	Path string `json:"path" jsonschema:"description=The file path to get info for"`
}

const (
	// Base directory for file operations - in a real deployment this should be configurable
	BASE_DIR = "/tmp/mcp-files"
)

func main() {
	if err := os.MkdirAll(BASE_DIR, 0755); err != nil {
		log.Fatalf("Failed to create base directory: %v", err)
	}

	transport := http.NewGinTransport()

	server := mcp_golang.NewServer(transport, mcp_golang.WithName("mcp-filesystem-server"), mcp_golang.WithVersion("0.0.1"))

	err := server.RegisterTool("write_file", "Write content to a file", func(ctx context.Context, args FileWriteArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("write_file request from User-Agent: %s", userAgent)

		log.Printf("Writing to file: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		dir := filepath.Dir(fullPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to create directory: %v", err))), nil
		}

		flags := os.O_CREATE | os.O_WRONLY
		switch args.Mode {
		case "append":
			flags |= os.O_APPEND
		default:
			flags |= os.O_TRUNC
		}

		file, err := os.OpenFile(fullPath, flags, 0644)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to open file: %v", err))), nil
		}
		defer file.Close()

		if _, err := file.WriteString(args.Content); err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to write content: %v", err))), nil
		}

		responseText := fmt.Sprintf("Successfully wrote %d bytes to %s", len(args.Content), args.Path)
		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("read_file", "Read content from a file", func(ctx context.Context, args FileReadArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("read_file request from User-Agent: %s", userAgent)

		log.Printf("Reading from file: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		content, err := os.ReadFile(fullPath)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to read file: %v", err))), nil
		}

		responseText := fmt.Sprintf("File content from %s:\n\n%s", args.Path, string(content))
		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("delete_file", "Delete a file", func(ctx context.Context, args FileDeleteArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("delete_file request from User-Agent: %s", userAgent)

		log.Printf("Deleting file: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		if err := os.Remove(fullPath); err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to delete file: %v", err))), nil
		}

		responseText := fmt.Sprintf("Successfully deleted file: %s", args.Path)
		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("list_directory", "List the contents of a directory", func(ctx context.Context, args DirectoryListArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("list_directory request from User-Agent: %s", userAgent)

		log.Printf("Listing directory: %s (recursive: %t)", args.Path, args.Recursive)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		var result strings.Builder
		result.WriteString(fmt.Sprintf("Contents of directory %s:\n\n", args.Path))

		if args.Recursive {
			err = filepath.WalkDir(fullPath, func(path string, d fs.DirEntry, err error) error {
				if err != nil {
					return err
				}

				relPath, err := filepath.Rel(fullPath, path)
				if err != nil {
					return err
				}
				if relPath == "." {
					return nil
				}

				info, err := d.Info()
				if err != nil {
					result.WriteString(fmt.Sprintf("  %s (error getting info: %v)\n", relPath, err))
					return nil
				}

				if d.IsDir() {
					result.WriteString(fmt.Sprintf("  📁 %s/\n", relPath))
				} else {
					result.WriteString(fmt.Sprintf("  📄 %s (%d bytes)\n", relPath, info.Size()))
				}
				return nil
			})
		} else {
			entries, err := os.ReadDir(fullPath)
			if err != nil {
				return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to read directory: %v", err))), nil
			}

			for _, entry := range entries {
				info, err := entry.Info()
				if err != nil {
					result.WriteString(fmt.Sprintf("  %s (error getting info: %v)\n", entry.Name(), err))
					continue
				}

				if entry.IsDir() {
					result.WriteString(fmt.Sprintf("  📁 %s/\n", entry.Name()))
				} else {
					result.WriteString(fmt.Sprintf("  📄 %s (%d bytes)\n", entry.Name(), info.Size()))
				}
			}
		}

		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error listing directory: %v", err))), nil
		}

		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(result.String())), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("create_directory", "Create a directory", func(ctx context.Context, args DirectoryCreateArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("create_directory request from User-Agent: %s", userAgent)

		log.Printf("Creating directory: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		if err := os.MkdirAll(fullPath, 0755); err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to create directory: %v", err))), nil
		}

		responseText := fmt.Sprintf("Successfully created directory: %s", args.Path)
		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("file_exists", "Check if a file or directory exists", func(ctx context.Context, args FileExistsArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("file_exists request from User-Agent: %s", userAgent)

		log.Printf("Checking if file exists: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		info, err := os.Stat(fullPath)
		if os.IsNotExist(err) {
			responseText := fmt.Sprintf("File or directory does not exist: %s", args.Path)
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
		} else if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error checking file: %v", err))), nil
		}

		var responseText string
		if info.IsDir() {
			responseText = fmt.Sprintf("Directory exists: %s", args.Path)
		} else {
			responseText = fmt.Sprintf("File exists: %s", args.Path)
		}

		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(responseText)), nil
	})
	if err != nil {
		panic(err)
	}

	err = server.RegisterTool("file_info", "Get detailed information about a file or directory", func(ctx context.Context, args FileInfoArgs) (*mcp_golang.ToolResponse, error) {
		ginCtx, ok := ctx.Value("ginContext").(*gin.Context)
		if !ok {
			return nil, fmt.Errorf("ginContext not found in context")
		}
		userAgent := ginCtx.GetHeader("User-Agent")
		log.Printf("file_info request from User-Agent: %s", userAgent)

		log.Printf("Getting info for: %s", args.Path)

		fullPath, err := validatePath(args.Path)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Error: %v", err))), nil
		}

		info, err := os.Stat(fullPath)
		if err != nil {
			return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(fmt.Sprintf("Failed to get file info: %v", err))), nil
		}

		var result strings.Builder
		result.WriteString(fmt.Sprintf("File information for %s:\n\n", args.Path))
		result.WriteString(fmt.Sprintf("  Name: %s\n", info.Name()))
		result.WriteString(fmt.Sprintf("  Size: %d bytes\n", info.Size()))
		result.WriteString(fmt.Sprintf("  Mode: %s\n", info.Mode()))
		result.WriteString(fmt.Sprintf("  Modified: %s\n", info.ModTime().Format("2006-01-02 15:04:05")))
		if info.IsDir() {
			result.WriteString("  Type: Directory\n")
		} else {
			result.WriteString("  Type: Regular file\n")
		}

		return mcp_golang.NewToolResponse(mcp_golang.NewTextContent(result.String())), nil
	})
	if err != nil {
		panic(err)
	}

	go server.Serve()

	r := gin.Default()

	r.POST("/mcp", transport.Handler())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	log.Println("Starting Filesystem MCP server on 0.0.0.0:8081...")
	if err := r.Run("0.0.0.0:8081"); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

// validatePath validates and sanitizes the file path to prevent directory traversal attacks
func validatePath(path string) (string, error) {
	cleanPath := filepath.Clean(path)

	fullPath := filepath.Join(BASE_DIR, cleanPath)

	if !strings.HasPrefix(fullPath, BASE_DIR) {
		return "", fmt.Errorf("path is outside allowed directory")
	}

	return fullPath, nil
}
