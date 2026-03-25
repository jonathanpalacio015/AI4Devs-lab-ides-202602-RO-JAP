import React, { useState } from "react";
import AddCandidateForm from "../components/AddCandidateForm";
import CandidateList from "../components/CandidateList";
import "../App.css"; // estilos globales

const Dashboard: React.FC = () => {
  // Por defecto el formulario está cerrado
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      {/* Barra de navegación */}
      <nav className="navbar">
        <h1>Panel del Reclutador</h1>

        {/* Botón visible en desktop y dentro del menú en móvil */}
        <div className={`nav-links ${menuOpen ? "show" : ""}`}>
          <button
            className="toggle-btn"
            onClick={() => {
              setShowForm(!showForm);
              setMenuOpen(false); // cerrar menú al hacer clic
            }}
          >
            {showForm ? "Cerrar formulario" : "Añadir candidato"}
          </button>
        </div>

        {/* Menú hamburguesa para móviles */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </nav>

      {/* Formulario solo visible si showForm es true */}
      {showForm && (
        <AddCandidateForm
          onCandidateAdded={() => {
            setRefreshTrigger(refreshTrigger + 1);
            setShowForm(false); // 👈 al guardar se cierra automáticamente
          }}
        />
      )}

      {/* Lista de candidatos siempre visible */}
      <CandidateList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default Dashboard;
