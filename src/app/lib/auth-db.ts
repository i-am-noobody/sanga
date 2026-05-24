export function isRecoverableAuthDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  return (
    name.includes("prismaclientinitializationerror") ||
    message.includes("p1001") ||
    message.includes("p2021") ||
    message.includes("can't reach database server") ||
    (message.includes("table") && message.includes("does not exist")) ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}