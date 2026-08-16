/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handlerZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue: any) => {
    errorSources.push({
      //path : "nickname iside lastname inside name"
      // path: issue.path.length > 1 && issue.path.reverse().join(" inside "),

      path: issue.path[issue.path.length - 1],
      message: issue.message,
    });
  });

  // Surface the actual field + reason instead of a bare "Zod Error" —
  // that generic message was indistinguishable from any other
  // validation failure and gave the person filling out the form (or
  // whoever they asked to debug it) nothing to go on.
  const summary = errorSources.map((source) => `${source.path}: ${source.message}`).join(", ");

  return {
    statusCode: 400,
    message: summary || "Validation error",
    errorSources,
  };
};
