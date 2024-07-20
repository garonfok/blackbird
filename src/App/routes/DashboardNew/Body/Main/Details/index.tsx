export function Details(props: { height: number }) {
  const { height } = props;

  return (
    <div
      className="bg-bg.1 border"
      style={{
        height,
      }}
    ></div>
  );
}
