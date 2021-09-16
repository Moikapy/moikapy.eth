export default function Button({
  children,
  buttonStyle = '',
  onPress = () => {},
  disabled = false,
}) {
  return (
    <button
      onClick={() => onPress()}
      className={`${buttonStyle} btn`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
