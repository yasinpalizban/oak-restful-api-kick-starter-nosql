import {config} from "https://deno.land/x/dotenv/mod.ts";
import {CoreConfig} from "../config/core.config.ts";
import {Bson, MongoClient} from "https://deno.land/x/mongo@v0.29.2/mod.ts";

// {
//     host: config().db_hostname ? config().db_hostname : CoreConfig.database.hostname,
//         username: config().db_username ? config().db_username : CoreConfig.database.username,
//     password: config().db_password ? config().db_password : CoreConfig.database.password,
//     database: config().db_name ? config().db_name : CoreConfig.database.name,
// }
const environment: string = config().app_environment ? config().app_environment : CoreConfig.environment
const dataBaseConnection = new MongoClient();
// Connecting to a Local Database
await dataBaseConnection.connect("mongodb://localhost:27017");
export default dataBaseConnection;
// // Connecting to a Mongo Atlas Database
// await dataBaseConnection.connect({
//     db: "<db_name>",
//     tls: true,
//     servers: [
//         {
//             host: "<db_cluster_url>",
//             port: 27017,
//         },
//     ],
//     credential: {
//         username: "<username>",
//         password: "<password>",
//         db: "<db_name>",
//         mechanism: "SCRAM-SHA-1",
//     },
// });

// Connect using srv url
// await client.connect(
//     "mongodb+srv://<username>:<password>@<db_cluster_url>/<db_name>?authMechanism=SCRAM-SHA-1",
// );


