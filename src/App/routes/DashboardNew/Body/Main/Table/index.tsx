export function Table(props: { minHeight: number }) {
  const { minHeight } = props;

  return (
    <div
      className="grow bg-bg.0 min-h-[50px]"
      style={{
        minHeight,
      }}
    ></div>
  );
}
