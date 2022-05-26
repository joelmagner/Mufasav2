// gives intellisense to process.env.*
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      discord_token: string;
      [key: string]: string | undefined;
    }
  }
}
// converting it into a module by adding an empty export statement.
export {};
