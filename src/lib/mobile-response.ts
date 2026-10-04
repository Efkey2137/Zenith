// This API serves the same public material as the website. Never pass author
// queries to it, even when the caller happens to have an admin cookie.
export function mobileResponse(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function mobileError() {
  return mobileResponse(
    { error: "Biblioteka jest chwilowo niedostępna. Spróbuj ponownie." },
    503,
  );
}
