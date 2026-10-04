import { eveChannel } from "eve/channels/eve";
import { TRO_LY_OKR_SOAN } from "../lib/config";
import { repTuCuaOkr } from "../lib/kenh-cua";

const secret = process.env[TRO_LY_OKR_SOAN.env.biMat]?.trim();

export default eveChannel({ auth: secret ? [repTuCuaOkr(secret)] : [] });
