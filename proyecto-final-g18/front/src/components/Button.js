// src/components/Button.js
export default function Button({ text, onClick }) {
  return (
    <button 
      onClick={onClick} 
      style={{
        background: "#2dd4bf",
        color: "#031417",
        border: "none",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background 0.3s ease"
      }}
      onMouseOver={(e) => e.target.style.background = "#249e81"}
      onMouseOut={(e) => e.target.style.background = "#2dd4bf"}
    >
      {text}
    </button>
  );
}
