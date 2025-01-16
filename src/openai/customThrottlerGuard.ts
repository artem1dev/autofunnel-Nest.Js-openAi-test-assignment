import { ThrottlerGuard } from "@nestjs/throttler";
import { ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected throwThrottlingException(context: ExecutionContext): Promise<void> {
        throw new HttpException(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: "You have exceeded the maximum number of requests. Please try again later.",
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}
