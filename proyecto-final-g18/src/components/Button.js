// src/components/Button.js
export default function Button({ text, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#2dd4bf",
      color: "#031417",
      border: "none",
      padding: "8px 12px",
      borderRadius: 8,
      cursor: "pointer"
    }}>
      {text}
    </button>
  );
}
