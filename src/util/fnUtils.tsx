export async function downloadImage(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${crypto.randomUUID()}.${blob?.type.split("/").at(-1)}`;
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export const markdownToText = (title: string) => title.replaceAll(/[*#]|(\[\d+\])+/g, "");

export function isMobileDevice() {
  const userAgent = navigator.userAgent;
  // Regular expressions to check for common mobile device keywords
  const mobileKeywords =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  return mobileKeywords.test(userAgent);
}
