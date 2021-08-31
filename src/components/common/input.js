export default function Input({
  id,
  onChange,
  label,
  type = 'text',
  min,
  max,
  pattern = '',
  placeholder = '',
  inputStyle = '',
  accept = '',
}) {
  return (
    <>
      <style jsx>{`
        input {
          min-height: 2.5rem;
        }
      `}</style>
      <label htmlFor={id} className={`text-capitalize`}>
        {label}
      </label>
      <input
        accept={accept}
        className={inputStyle}
        type={type}
        pattern={pattern}
        placeholder={placeholder}
        onChange={async (e) => {
          e.preventDefault();
          if (e !== null) onChange(e);
        }}
        min={min}
        max={max}
        spellCheck
      />
    </>
  );
}
