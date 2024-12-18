import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Input,
  Select,
  Button,
  Spacer,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import saveAs from "file-saver";

export const genero = [
  { key: "M", label: "Masculino" },
  { key: "F", label: "Femenino" },
];

interface FormData {
  fechaActual: string;
  nombre: string;
  cedula: string;
  fechaNacimiento: string;
  sexo: string;
  edad: string;
  estudio: string;
  informe: string;
}

const FormularioPaciente: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fechaActual: new Date().toISOString().split("T")[0],
    nombre: "",
    cedula: "",
    fechaNacimiento: "",
    sexo: "",
    edad: "",
    estudio: "",
    informe: "",
  });

  const [cedulaError, setCedulaError] = useState<string | null>(null);

  // Validar cédula
  const validarCedula = (cedula: string) => {
    if (cedula.length === 10 || cedula.length === 13) {
      setCedulaError(null);

      return true;
    } else {
      setCedulaError("La cédula debe tener 10 o 13 dígitos.");

      return false;
    }
  };

  // Manejo de cambios en los inputs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "cedula") {
      validarCedula(value);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "fechaNacimiento") {
      calcularEdad(value);
    }
  };

  // Cálculo de edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento: string) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - nacimiento.getMonth();
    const diferenciaDias = hoy.getDate() - nacimiento.getDate();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && diferenciaDias < 0)) {
      edad -= 1;
    }

    setFormData((prevData) => ({
      ...prevData,
      edad: edad.toString(),
    }));
  };

  // Descargar documento Word
  const handleDownloadWord = async () => {

    // Convertir los saltos de línea en el informe a párrafos
    const informeParrafos = formData.informe.split("\n").map((linea) =>
    new Paragraph({
        children: [new TextRun(linea)],
      })
    );
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Informe del Paciente",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph(""),
            new Paragraph(`Fecha Actual: ${formData.fechaActual}`),
            new Paragraph(`Nombre del Paciente: ${formData.nombre}`),
            new Paragraph(`Cédula: ${formData.cedula}`),
            new Paragraph(`Fecha de Nacimiento: ${formData.fechaNacimiento}`),
            new Paragraph(`Sexo: ${formData.sexo}`),
            new Paragraph(`Edad: ${formData.edad} años`),
            new Paragraph(""),
            new Paragraph(`Estudio: ${formData.estudio}`),
            new Paragraph(""),
            new Paragraph({
              children: [new TextRun({ text: "Informe:", bold: true })],
            }),
            new Paragraph(""),
            ...informeParrafos,
            // Despedida y firma del doctor centradas
            new Paragraph(""),
            new Paragraph(""),
            new Paragraph(""),
            new Paragraph({
              text: "ATENTAMENTE",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph(""),
            new Paragraph(""),
            new Paragraph(""),
            new Paragraph(""),
            new Paragraph({
              text: "________________________________",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "DR. JOSE JOAQUIN MOSCOSO CORREA.",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "IMAGENOLOGO",
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    // Generar el archivo Word y descargarlo
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Informe_Paciente_${formData.nombre || "SinNombre"}.docx`);
    });
  };

  // Envío del formulario
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validarCedula(formData.cedula)) {
      console.log("Datos del formulario:", formData);
    } else {
      console.log("Error en la cédula:", cedulaError);
    }
  };

  return (
    <DefaultLayout>
      <form onSubmit={handleSubmit}>
        <Input
          readOnly
          label="Fecha Actual"
          name="fechaActual"
          type="date"
          value={formData.fechaActual}
        />
        <Spacer y={1} />
        <Input
          required
          label="Nombre del Paciente"
          name="nombre"
          placeholder="Ingresa el nombre"
          value={formData.nombre}
          onChange={handleInputChange}
        />
        <Spacer y={1} />
        <Input
          required
          label="Cédula de Identidad"
          name="cedula"
          placeholder="Ingresa la cédula"
          value={formData.cedula}
          onChange={handleInputChange}
        />
        <Spacer y={1} />
        <Input
          required
          label="Fecha de Nacimiento"
          name="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleInputChange}
        />
        <Spacer y={1} />
        <Select
        className="max-w-xs"
        label="Seleccione el género"
        name="sexo"
        value={formData.sexo}
        onChange={(e) =>
        setFormData((prevData) => ({
        ...prevData,
        sexo: e.target.value,
        }))
        }
        >
          {genero.map((genero) => (
            <SelectItem key={genero.key}>{genero.label}</SelectItem>
          ))}
        </Select>
        <Spacer y={1} />
        <Input
          readOnly
          label="Edad"
          name="edad"
          placeholder="Calculada automáticamente"
          value={formData.edad}
        />
        <Spacer y={2} />
        <Input
          required
          label="Estudio"
          name="estudio"
          placeholder="Ingresa el estudio"
          value={formData.estudio}
          onChange={handleInputChange}
        />
        <Spacer y={1} />
        <Textarea
          required
          label="Informe"
          name="informe"
          placeholder="Escribe el informe"
          value={formData.informe}
          onChange={(e) =>
            handleInputChange(e as unknown as ChangeEvent<HTMLInputElement>)
          }
        />
        <Spacer y={2} />
        <Button type="submit">Guardar</Button>
        <Button type="button" onPress={handleDownloadWord}>
          Descargar Word
        </Button>
      </form>
    </DefaultLayout>

  );
};

export default FormularioPaciente;
