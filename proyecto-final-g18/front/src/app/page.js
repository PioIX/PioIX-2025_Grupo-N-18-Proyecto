"use client";
// src/app/page.js
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Title from "@/components/Title";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function crearSala() {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    router.push(`/juego?room=${random}`);
  }

  function unirseSala() {
    if (!code.trim()) return alert("Ingresá un código de sala");
    router.push(`/juego?room=${code.trim()}`);
  }

  return (
    <div className={styles.container}>
      <Title text="Bienvenido — Truco 1 vs 1" />
      <div style={{ textAlign: "center", maxWidth: 640 }}>
        <p>
          Crea una sala o unite con tu amigo mediante un código. Cada sala es para 2 jugadores.
        </p>
      </div>

      <div className={styles.actions}>
        <Button text="Crear sala" onClick={crearSala} />
        <input
          className={styles.input}
          placeholder="Código de sala (ej: 1234)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button text="Unirse" onClick={unirseSala} />
      </div>
    </div>
  );
}
