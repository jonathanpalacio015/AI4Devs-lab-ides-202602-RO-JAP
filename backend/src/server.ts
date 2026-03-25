import { app } from './index';

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
