
import "./messages.tact";
import "./jetton.tact";



contract KKFI with Jetton {
    totalSupply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;

    max_supply: Int as coins; 

    init(content: Cell) {
        self.totalSupply = 0;
        self.owner = sender(); // msg.sender
        self.mintable = true;
        self.content = content; // metadata for token like name, symbol, description and image

        self.max_supply = 1000000000 * pow(10,9); 
    }

    receive(msg: Mint) {
        let ctx: Context = context();
        self.requireOwner();  
        require(self.mintable, "Can't Mint Anymore");
        self.mint(msg.receiver, msg.amount, self.owner); // (to, amount, response_destination)

    }
    
    // handler for "MintClose" textual message - this is a textual string message, these cannot carry input arguments
    receive("MintClose") { 
        let ctx: Context = context();
        self.requireOwner();  
        self.mintable = false; // close mint
    }
} 


