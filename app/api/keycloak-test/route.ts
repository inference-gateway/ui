import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test connection to Keycloak from server side
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/.well-known/openid-configuration`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Server can connect to Keycloak",
      serverUrl: process.env.KEYCLOAK_ISSUER,
      clientUrl:
        process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_URL ||
        "http://localhost:8081/realms/app-realm",
      wellKnownEndpoint: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server failed to connect to Keycloak",
        error: error instanceof Error ? error.message : String(error),
        serverUrl: process.env.KEYCLOAK_ISSUER,
      },
      { status: 500 }
    );
  }
}
