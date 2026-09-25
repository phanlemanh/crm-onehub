import { Injectable } from "@nestjs/common";
import { AuthMiddleware } from "./auth.middleware";

@Injectable()
export class PhamViDoiTacMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "doi-tac" as const;
}

@Injectable()
export class PhamViToChucMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "to-chuc" as const;
}

@Injectable()
export class PhamViOkrMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "okr" as const;
}

@Injectable()
export class PhamViChungMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "chung" as const;
}
