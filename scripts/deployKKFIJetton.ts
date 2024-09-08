import { Address, toNano } from '@ton/core';
import { KKFI } from '../wrappers/KKFI';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from '../utils/jetton-helpers';

export async function run(provider: NetworkProvider) {
    const jettonParams = {
        name: "KAKU Finance",
        description: "Unchain your finances with KAKU. The revolutionary Web3 fintech platform for the global citizen https://kaku.finance/",
        symbol: "KKFI",
        image: "https://framerusercontent.com/images/tJCpJUwEqUVchM31DN7YNq4hQYg.png",
        decimals: 9
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);

    const KKFIJetton = provider.open(await KKFI.fromInit(content));

    // await KKFIJetton.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.05'),
    //     },
    //     {
    //         $$type: 'Mint',
    //         amount: 1000000000000000000n,
    //         receiver: provider.sender().address as Address
    //     }
    // );

    await provider.waitForDeploy(KKFIJetton.address);

}