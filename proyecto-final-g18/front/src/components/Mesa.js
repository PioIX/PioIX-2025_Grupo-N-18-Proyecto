// src/components/Mesa.js
export default function Mesa({ jugadas }) {
  return (
    <div>
      {jugadas.map((jugada, index) => (
        <div key={index}>
          <p>{jugada.local.nombre} vs {jugada.rival.nombre}</p>
        </div>
      ))}
    </div>
  );
}
