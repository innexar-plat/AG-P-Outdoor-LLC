export function EmbedScript({ src }: { src: string }) {
  return (
    <script
      async
      src={src}
      charSet="utf-8"
    />
  );
}
