import { NextFunction, Request, Response } from 'express';
import { stringReplace } from 'string-replace-middleware';

export default (prefix: string, replaceWith?: string) => {
  const concernedEnvVars = Object.keys(process.env).filter((key) =>
    key.startsWith(prefix),
  );

  const replaceRules = concernedEnvVars.reduce((acc, key) => {
    let newKey = key;
    if (replaceWith) {
      newKey = key.replace(prefix, replaceWith);
    }
    acc[newKey.replaceAll('_', '')] = process.env[key];
    return acc;
  }, {} as any);

  return (req: Request, res: Response, next: NextFunction) => {
    const isReplaceableFileExtension = ['js', 'css', 'html'].some((ext) =>
      req.path.endsWith(ext),
    );
    if (req.path.includes('spreadsheet') || !isReplaceableFileExtension) {
      next();
      return;
    }
    stringReplace(replaceRules, {
      contentTypeFilterRegexp: /.*/,
    })(req, res, next);
  };
};
