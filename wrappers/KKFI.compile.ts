import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/KKFIToken.tact',
    options: {
        debug: true,
    },
};
