import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, beginCell, Slice, toNano } from '@ton/core';
import { KKFI } from '../wrappers/KKFI';
import '@ton/test-utils';
import { JettonDefaultWallet } from '../build/KKFI/tact_JettonDefaultWallet';
import { buildOnchainMetadata } from '../utils/jetton-helpers';

describe('KKFI', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let receiver: SandboxContract<TreasuryContract>;
    let kKFI: SandboxContract<KKFI>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    const jettonParams = {
        name: "Best Practice",
        description: "This is description of Test tact jetton",
        symbol: "XXXE",
        image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
    };
    let content = buildOnchainMetadata(jettonParams)

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        
        
        deployer = await blockchain.treasury('deployer');
        receiver = await blockchain.treasury('receiver');

        kKFI = blockchain.openContract(await KKFI.fromInit(content));

        const deployResult = await kKFI.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                amount: toNano("1"),
                receiver:receiver.address
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
        expect(owner).toEqualAddress(deployer.address);
    });

    it("should check whether contract deployed successfully", async () => {
        expect((await kKFI.getGetJettonData()).owner).toEqualAddress(deployer.address)
        expect((await kKFI.getGetJettonData()).totalSupply).toEqual(toNano("1"))
        expect((await kKFI.getGetJettonData()).max_supply).toEqual(toNano("1000000000"))
        expect((await kKFI.getGetJettonData()).content).toEqualCell(content)
        expect((await kKFI.getGetJettonData()).mintable).toEqual(true)
    });

    it('should mint', async () => {
        const mintAmount =  toNano("10");
        const oldTotalSupply = (await kKFI.getGetJettonData()).totalSupply;
        const deployResult = await kKFI.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                amount: mintAmount,
                receiver:receiver.address
            }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: kKFI.address,
            success: true,
        });
        expect((await kKFI.getGetJettonData()).totalSupply).toEqual(oldTotalSupply+mintAmount);



        const playerWallet = await kKFI.getGetWalletAddress(receiver.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));


        const walletData = await jettonWallet.getGetWalletData();
        expect(walletData.owner).toEqualAddress(receiver.address);
        expect(walletData.balance).toBeGreaterThanOrEqual(mintAmount);
    })
    
    it('should be able to transfer tokens', async () => {
        const playerWallet = await kKFI.getGetWalletAddress(receiver.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(playerWallet));
        let forwardPayload = beginCell().storeUint(0x1234567890abcdefn, 128).endCell().asSlice();

        const deployResult = await jettonWallet.send(
            receiver.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'TokenTransfer',
                queryId :0n,
                amount :toNano('5'),
                destination:deployer.address,
                response_destination:deployer.address,
                custom_payload:null,
                forward_ton_amount:0n,
                forward_payload: forwardPayload
                
            }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: receiver.address,
            to: jettonWallet.address,
            success: true,
        });



        const receiverWallet = await kKFI.getGetWalletAddress(deployer.address);
        jettonWallet = blockchain.openContract(JettonDefaultWallet.fromAddress(receiverWallet));


        const walletData = await jettonWallet.getGetWalletData();
        expect(walletData.owner).toEqualAddress(deployer.address);
        expect(walletData.balance).toBeGreaterThanOrEqual(toNano('5'));

    });

    it("should revert if non owner try to change token metadata",async () => {
        const jettonParams = {
            name: "KKFI",
            description: "This is description of Test tact jetton",
            symbol: "XXXE",
            image: "https://play-lh.googleusercontent.com/ahJtMe0vfOlAu1XJVQ6rcaGrQBgtrEZQefHy7SXB7jpijKhu1Kkox90XDuH8RmcBOXNn",
        };
        let content = buildOnchainMetadata(jettonParams)
    
        const unAuthMintResult = await kKFI.send(
            receiver.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type:'TokenUpdateContent',
                content
            }
        );
        expect(unAuthMintResult.transactions).toHaveTransaction({
            from: receiver.address,
            to: kKFI.address,
            aborted: true,
        });
    })

    it('should revert if non owner try to mint', async () => {
        const mintAmount =  toNano("10");
        const deployResult = await kKFI.send(
            receiver.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Mint',
                amount: mintAmount,
                receiver:receiver.address
            }
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: receiver.address,
            to: kKFI.address,
            aborted: true,
        });
      
    })
   
    it('should revert if non owner try to close mint', async () => {
        const deployResult =   await kKFI.send(
            receiver.getSender(), 
            { value: toNano("0.05") },
            "MintClose"
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: receiver.address,
            to: kKFI.address,
            aborted: true
        });
      
    })

    it('should allow owner to close mint', async () => {
        const deployResult =   await kKFI.send(
            deployer.getSender(), 
            { value: toNano("0.05") },
            "MintClose"
        );
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: kKFI.address,
            success: true,
        });
      
    })
});
