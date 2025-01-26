import { MfaController } from "./mfa.controller";
import { MfaService } from "./mfa.service";

const mfaService = new MfaService();
const mfaControlller = new MfaController(mfaService);

export { mfaService, mfaControlller };
