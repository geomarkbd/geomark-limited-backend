// import { NextFunction, Request, Response, RequestHandler } from "express";
// import { z } from "zod";

// export const validateRequest =
//   (zodSchema: z.ZodTypeAny): RequestHandler =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (req.body.data) {
//         req.body = JSON.parse(req.body.data);
//       }

//       req.body = await zodSchema.parseAsync(req.body);

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };

import { NextFunction, Request, Response, RequestHandler } from "express";
import { z } from "zod";

export const validateRequest =
  (zodSchema: z.ZodTypeAny): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let parsedBody = req.body ?? {};

      if (typeof parsedBody.data === "string") {
        parsedBody = JSON.parse(parsedBody.data);
      }

      req.body = await zodSchema.parseAsync(parsedBody);
      next();
    } catch (error) {
      next(error);
    }
  };
