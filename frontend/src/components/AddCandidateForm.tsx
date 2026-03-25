import React, { useState } from "react";

interface AddCandidateFormProps {
  onCandidateAdded: () => void;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

const AddCandidateForm: React.FC<AddCandidateFormProps> = ({ onCandidateAdded }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    educations: [] as Education[],
    experiences: [] as Experience[],
    cvFile: null as File | null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, cvFile: e.target.files[0] });
    }
  };

  // Educación dinámica
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newEdus = [...formData.educations];
    newEdus[index] = { ...newEdus[index], [field]: value };
    setFormData({ ...formData, educations: newEdus });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [
        ...formData.educations,
        { school: "", degree: "", field: "", startDate: "", endDate: "" },
      ],
    });
  };

  const removeEducation = (index: number) => {
    const newEdus = formData.educations.filter((_, i) => i !== index);
    setFormData({ ...formData, educations: newEdus });
  };

  // Experiencias dinámicas
  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setFormData({ ...formData, experiences: newExperiences });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, { company: "", role: "", startDate: "", endDate: "", description: "" }],
    });
  };

  const removeExperience = (index: number) => {
    const newExperiences = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: newExperiences });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Correo inválido");
      return;
    }

    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);

      if (formData.cvFile) data.append("cvFile", formData.cvFile);

      // Arrays como JSON
      data.append("educations", JSON.stringify(formData.educations));
      data.append("experiences", JSON.stringify(formData.experiences));

      const response = await fetch("http://localhost:3010/api/candidates", {
        method: "POST",
        body: data, // 👈 ahora se envía el FormData correcto
      });

      if (response.ok) {
        setMessage("Candidato añadido exitosamente");
        // Resetear formulario
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          educations: [],
          experiences: [],
          cvFile: null,
        });
        onCandidateAdded(); // refresca lista
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.message || "Error al añadir candidato");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error de conexión con el servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>➕ Agregar Nuevo Candidato</h2>
      
      <h3 style={{ marginTop: "0" }}>Información Personal</h3>
      <input 
        type="text" 
        name="firstName" 
        placeholder="Nombre *" 
        value={formData.firstName} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="text" 
        name="lastName" 
        placeholder="Apellido *" 
        value={formData.lastName} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="email" 
        name="email" 
        placeholder="Correo electrónico *" 
        value={formData.email} 
        onChange={handleChange} 
        required 
      />
      <input 
        type="text" 
        name="phone" 
        placeholder="Teléfono" 
        value={formData.phone} 
        onChange={handleChange} 
      />
      <input 
        type="text" 
        name="address" 
        placeholder="Dirección" 
        value={formData.address} 
        onChange={handleChange} 
      />

      <h3>🎓 Educación</h3>
      {formData.educations.length === 0 ? (
        <p style={{ color: "#999", fontSize: "14px", textAlign: "center", margin: "10px 0" }}>
          Sin educación agregada
        </p>
      ) : (
        formData.educations.map((edu, index) => (
          <div key={index} className="edu-block">
            <input
              type="text"
              placeholder="Institución / Escuela"
              value={edu.school}
              onChange={(e) => handleEducationChange(index, "school", e.target.value)}
            />
            <input
              type="text"
              placeholder="Grado / Título"
              value={edu.degree}
              onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
            />
            <input
              type="text"
              placeholder="Campo de estudio"
              value={edu.field}
              onChange={(e) => handleEducationChange(index, "field", e.target.value)}
            />
            <input
              type="date"
              value={edu.startDate}
              onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
            />
            <input
              type="date"
              value={edu.endDate}
              onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
            />
            <button type="button" onClick={() => removeEducation(index)}>
              🗑️ Eliminar Educación
            </button>
          </div>
        ))
      )}
      <button type="button" onClick={addEducation}>
        ➕ Agregar Educación
      </button>

      <h3>💼 Experiencias Laborales</h3>
      {formData.experiences.length === 0 ? (
        <p style={{ color: "#999", fontSize: "14px", textAlign: "center", margin: "10px 0" }}>
          Sin experiencias agregadas
        </p>
      ) : (
        formData.experiences.map((exp, index) => (
          <div key={index} className="exp-block">
            <input
              type="text"
              placeholder="Empresa"
              value={exp.company}
              onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
            />
            <input
              type="text"
              placeholder="Puesto / Rol"
              value={exp.role}
              onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
            />
            <input
              type="date"
              value={exp.startDate}
              onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
            />
            <input
              type="date"
              value={exp.endDate}
              onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
            />
            <textarea
              placeholder="Descripción de responsabilidades y logros"
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
            />
            <button type="button" onClick={() => removeExperience(index)}>
              🗑️ Eliminar Experiencia
            </button>
          </div>
        ))
      )}
      <button type="button" onClick={addExperience}>
        ➕ Agregar Experiencia
      </button>

      <h3>📄 Archivo CV</h3>
      <label>Cargar CV (PDF, DOC, DOCX):</label>
      <input
        type="file"
        name="cvFile"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      <button type="submit">
        ✅ Guardar Candidato
      </button>
      
      {message && (
        <p style={{ 
          color: message.includes("exitosamente") ? "#28a745" : "#dc3545",
          padding: "12px",
          borderRadius: "6px",
          background: message.includes("exitosamente") ? "#e8f5e9" : "#fadbd8",
          border: `1px solid ${message.includes("exitosamente") ? "#28a745" : "#dc3545"}`,
          margin: "12px 0 0 0"
        }}>
          {message}
        </p>
      )}
    </form>
  );
};

export default AddCandidateForm;

