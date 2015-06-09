// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// ROMs with (n >= 4) * 8K banks, mapped in 4 8K banks starting at 0x4000
CartridgeKonami = function(rom) {
    var self = this;

    function init() {
        self.rom = rom;
        var content = self.rom.content;
        bytes = Util.arrayFill(new Array(content.length), 0xff);
        for(var i = 0, len = content.length; i < len; i++)
            bytes[i] = content[i];
        numBanks = (content.length / 8192) | 0;
    }

    this.powerOn = function(paused) {
        bank1Offset = bank2Offset = bank3Offset = bank4Offset = -0x4000;
    };

    this.powerOff = function() {
    };

    this.write = function(address, value) {
        // bank 1 is fixed at 0x0000
        if (address >= 0x6000 && address < 0x7fff)
            bank2Offset = (value % numBanks) * 0x2000 - 0x6000;
        else if (address >= 0x8000 && address < 0x9fff)
            bank3Offset = (value % numBanks) * 0x2000 - 0x8000;
        else if (address >= 0xa000 && address < 0xbfff)
            bank4Offset = (value % numBanks) * 0x2000 - 0xa000;
    };

    this.read = function(address) {
        if (address < 0x6000)
            return bytes[bank1Offset + address];
        else if (address < 0x8000)
            return bytes[bank2Offset + address];
        else if (address < 0xa000)
            return bytes[bank3Offset + address];
        else
            return bytes[bank4Offset + address];
    };

    this.dump = function(from, quant) {
        var res = "";
        var i;
        for(i = from; i <= from + quant; i++) {
            res = res + i.toString(16, 2) + " ";
        }
        res += "\n";
        for(i = from; i <= from + quant; i++) {
            var val = this.read(i);
            res = res + (val != undefined ? val.toString(16, 2) + " " : "? ");
        }
        return res;
    };


    var bytes;

    var bank1Offset;
    var bank2Offset;
    var bank3Offset;
    var bank4Offset;
    var numBanks;

    this.rom = null;
    this.format = SlotFormats.CartridgeUnbanked;


    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            r: this.rom.saveState(),
            b: btoa(Util.uInt8ArrayToByteString(bytes)),
            b1: bank1Offset,
            b2: bank2Offset,
            b3: bank3Offset,
            b4: bank4Offset,
            n: numBanks
        };
    };

    this.loadState = function(s) {
        this.rom = ROM.loadState(s.r);
        bytes = Util.byteStringToUInt8Array(atob(s.b));
        bank1Offset = s.b1;
        bank2Offset = s.b2;
        bank3Offset = s.b3;
        bank4Offset = s.b4;
        numBanks = s.n;
    };



    if (rom) init();

};

CartridgeKonami.createFromSaveState = function(state) {
    var cart = new CartridgeKonami();
    cart.loadState(state);
    return cart;
};
