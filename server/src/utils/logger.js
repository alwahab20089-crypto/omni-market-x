const log = (level) => (msg, meta = {}) =>
  console[level === 'error' ? 'error' : 'log'](
    JSON.stringify({ level, time: new Date().toISOString(), msg, ...meta })
  );

export const logger = { info: log('info'), warn: log('warn'), error: log('error') };