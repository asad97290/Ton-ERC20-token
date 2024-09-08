import "@stdlib/ownable";
import "./jettonWallet.tact";

struct JettonData {
    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;
    walletCode: Cell;
    max_supply: Int;
}

@interface("org.ton.jetton.master")
trait Jetton with Ownable {

    totalSupply: Int;
    mintable: Bool;
    owner: Address;
    content: Cell;

    max_supply: Int; // This is not in the TEP-74 interface

    receive(msg: TokenUpdateContent) {
        self.requireOwner();                // Allow changing metadata content only by owner
        self.content = msg.content;         // Update metadata content
    }

    // ====== private Method ====== //
    // @to The Address receive the Jetton token after minting
    // @amount The amount of Jetton token being minted
    // @response_destination The previous owner address
    fun mint(to: Address, amount: Int, response_destination: Address) {
        require(self.totalSupply + amount <= self.max_supply, "The total supply will be overlapping.");
        self.totalSupply = self.totalSupply + amount; // Update total supply

        let winit: StateInit = self.getJettonWalletInit(to); 
        send(SendParameters{
            to: contractAddress(winit), 
            value: 0, 
            bounce: false,
            mode: SendRemainingValue,
            body: TokenTransferInternal{ 
                queryId: 0,
                amount: amount,
                from: myAddress(), // myAddress() is the address of this contract
                response_destination: response_destination,
                forward_ton_amount: 0,
                forward_payload: emptySlice()
            }.toCell(),
            code: winit.code,
            data: winit.data
        });
    }

 
    // virtual functions can be overridden by users of this trait
    // create new JettonWallet for each holder of token
    virtual fun getJettonWalletInit(address: Address): StateInit {
        return initOf JettonWallet(myAddress(), address); // myAddress() is the address of this contract
    }

    // ====== Get Methods ====== //
    get fun get_jetton_data(): JettonData {
        let code: Cell = self.getJettonWalletInit(myAddress()).code;
        return JettonData{ 
            totalSupply: self.totalSupply, 
            mintable: self.mintable, 
            owner: self.owner, 
            content: self.content, 
            max_supply: self.max_supply,
            walletCode: code,
        };
    }

    get fun get_wallet_address(owner: Address): Address {
        let winit: StateInit = self.getJettonWalletInit(owner);
        return contractAddress(winit);
    }
}
