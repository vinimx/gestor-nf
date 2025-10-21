interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  dataDeCriacao: Date;
  dataDeAtualizacao: Date;
  tipoDeUsuario: "admin" | "user";
}
