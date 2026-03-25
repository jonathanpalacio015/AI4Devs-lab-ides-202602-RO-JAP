import React, { useEffect, useState } from "react";

interface Education {
  id: number;
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

interface Experience {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: Education[];
  cvFilePath?: string;
  experiences: Experience[];
}

interface CandidateListProps {
  refreshTrigger: number;
}

const CandidateList: React.FC<CandidateListProps> = ({ refreshTrigger }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3010/api/candidates")
      .then((res) => res.json())
      .then((data) => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar candidatos:", err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) return <p style={{ textAlign: "center", padding: "20px", fontSize: "16px" }}>Cargando candidatos...</p>;

  if (candidates.length === 0) {
    return (
      <div id="list">
        <h2>Lista de candidatos</h2>
        <p style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "20px" }}>
          No hay candidatos registrados aún. ¡Agrega uno para comenzar!
        </p>
      </div>
    );
  }

  return (
    <div id="list">
      <h2>📋 Lista de candidatos ({candidates.length})</h2>
      <div className="candidates-grid">
        {candidates.map((c) => (
          <div key={c.id} className="candidate-card">
            <h3>
              👤 {c.firstName} {c.lastName}
            </h3>
            <p>
              <strong>📧 Correo:</strong> <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
            {c.phone && (
              <p>
                <strong>📱 Teléfono:</strong> {c.phone}
              </p>
            )}
            {c.address && (
              <p>
                <strong>📍 Dirección:</strong> {c.address}
              </p>
            )}

            <h4>🎓 Educación</h4>
            {c.educations.length > 0 ? (
              <ul>
                {c.educations.map((edu) => (
                  <li key={edu.id}>
                    <strong>{edu.degree}</strong> en {edu.school}
                    {edu.field && ` - ${edu.field}`}
                    {edu.startDate && ` (${new Date(edu.startDate).getFullYear()} - ${edu.endDate ? new Date(edu.endDate).getFullYear() : "Actual"})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "13px", color: "#999" }}>Sin educación registrada</p>
            )}

            <h4>💼 Experiencias</h4>
            {c.experiences.length > 0 ? (
              <ul>
                {c.experiences.map((exp) => (
                  <li key={exp.id}>
                    <strong>{exp.role}</strong> en {exp.company}
                    <br />
                    <small>
                      {new Date(exp.startDate).toLocaleDateString('es-ES')} - 
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString('es-ES') : " Actual"}
                    </small>
                    {exp.description && <br />}
                    {exp.description && <small>{exp.description}</small>}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: "13px", color: "#999" }}>Sin experiencias registradas</p>
            )}

            <h4>📄 CV</h4>
            {c.cvFilePath ? (
              <a href={`http://localhost:3010${c.cvFilePath}`} target="_blank" rel="noopener noreferrer">
                ⬇️ Descargar CV
              </a>
            ) : (
              <p style={{ fontSize: "13px", color: "#999" }}>CV no disponible</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;
