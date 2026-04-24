import { env } from "./config/env.js";
import app from "./app.js";

const Port = env.PORT;

app.listen(Port, () => {
    console.log(`Server is running on the ${Port} port`)
})
