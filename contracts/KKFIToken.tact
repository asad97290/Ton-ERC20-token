
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
        self.content = content;

        self.max_supply = 1000000000 * pow(10,9); // Initial Setting for max_supply
    }

    receive(msg: Mint) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only Owner");
        require(self.mintable, "Can't Mint Anymore");
        self.mint(msg.receiver, msg.amount, self.owner); // (to, amount, response_destination)
    }

  

    receive("Owner: MintClose") {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only Owner");
        self.mintable = false;
    }


 
} 


