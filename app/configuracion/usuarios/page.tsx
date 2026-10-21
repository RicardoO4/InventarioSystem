import { InvitarUsuarioForm } from "@/components/configuracion/invitar-usuario-form";
import { UsuarioAcciones } from "@/components/configuracion/usuario-acciones";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableContainer, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { getPerfil } from "@/lib/auth";
import { getPerfiles } from "@/lib/data";

export default async function UsuariosPage() {
  const [perfilActual, usuarios] = await Promise.all([getPerfil(), getPerfiles()]);

  return (
    <div>
      <PageHeader
        title="Usuarios y permisos"
        description="Administra quién puede acceder al sistema y con qué rol."
        actions={<InvitarUsuarioForm />}
      />

      <TableContainer>
        <Table>
          <THead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </Tr>
          </THead>
          <TBody>
            {usuarios.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-10 text-center text-sm text-zinc-400">
                  Sin usuarios registrados
                </Td>
              </Tr>
            ) : (
              usuarios.map((usuario) => (
                <Tr key={usuario.id}>
                  <Td className="font-medium text-zinc-900">{usuario.nombre || "—"}</Td>
                  <Td className="text-zinc-500">{usuario.email}</Td>
                  <Td>
                    <Badge tone={usuario.rol === "admin" ? "indigo" : "gray"}>
                      {usuario.rol === "admin" ? "Administrador" : "Operador"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={usuario.activo ? "green" : "red"}>
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </Td>
                  <Td>
                    <UsuarioAcciones usuario={usuario} esUnoMismo={usuario.id === perfilActual?.id} />
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </TableContainer>
    </div>
  );
}
