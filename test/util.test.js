describe("Accumulator", function(){
    it('should throw error if any parameter is not defined', function() {
        expect( function() { new Accumulator();}).toThrow(new Error("Accumulator: parameter missing."));
    });
    
    it('should not run action if initial is 0 and 0 is added', function(){
        var a = new Accumulator(0, 1, function(){});
        spyOn(a, 'action');
        
        a.add(0);
        expect(a.action).not.toHaveBeenCalled();
    });
    it('should run action if initial == interval and 0 is added', function(){
        var a = new Accumulator(0, 0, function(){});
        spyOn(a, 'action');
        
        var b = new Accumulator(1, 1, function(){});
        spyOn(b, 'action');
        
        a.add(0);
        b.add(0);
        expect(a.action).toHaveBeenCalled();
        expect(b.action).toHaveBeenCalled();
    });
});



describe("isDefined", function(){
    it('should identify defined arg', function(){
        expect(isDefined({})).toBe(true);
    });
    it('should identify undefined arg', function(){
        var someUndefinedVariable;
        expect(isDefined(someUndefinedVariable)).toBe(false);
    });
    it('should return false for no arg', function(){
        expect(isDefined()).toBe(false);
    });
});

describe("isAllDefined", function(){
    it('should return true for empty args', function(){
        expect(isAllDefined()).toBe(true);
    });
    it('single defined arg', function(){
        expect(isAllDefined([])).toBe(true);
    });
    it('single undefined arg', function(){
        var someUndefinedVariable;
        expect(isAllDefined(someUndefinedVariable)).toBe(false);
    });
    it('undefined + defined arg', function(){
        var someUndefinedVariable;
        var defined = 1;
        expect(isAllDefined(someUndefinedVariable, defined)).toBe(false);
    });
    it('2 undefined args', function(){
        var a = 1;
        var b = 2;
        expect(isAllDefined(a, b)).toBe(true);
    });
    it('2 undefined args', function(){
        var a;
        var b;
        expect(isAllDefined(a, b)).toBe(false);
    });
});
