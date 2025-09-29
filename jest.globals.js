global.self = global;
if (typeof window === 'undefined') global.window = global;
if (typeof navigator === 'undefined') global.navigator = { userAgent: 'node' };
