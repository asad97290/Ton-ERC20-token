import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import { KKFI } from '../wrappers/KKFI';
import '@ton/test-utils';

describe('KKFI', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let receiver: SandboxContract<TreasuryContract>;
    let kKFI: SandboxContract<KKFI>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        const cell = new Cell();
        deployer = await blockchain.treasury('deployer');
        receiver = await blockchain.treasury('receiver');
        kKFI = blockchain.openContract(await KKFI.fromInit(cell));


        const deployResult = await kKFI.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: kKFI.address,
            deploy: true,
            success: true,
        });
    });

    it('should check owner address', async () => {
        const owner = await kKFI.getOwner()


        const deployResult = await kKFI.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                amount: 1n,
                receiver:receiver.address
            }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: kKFI.address,
            success: true,
        });
        expect(owner).toEqualAddress(deployer.address);
        expect((await kKFI.getGetJettonData()).totalSupply).toEqual(1n);
        expect((await kKFI.getGetJettonData()).mintable).toEqual(true)
        
    });


});
