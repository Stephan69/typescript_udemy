interface IPerson {
    name: string;
    age: number;
    formatPerson() : string;
}


class App<T> extends Object{

    private _objecttype : T | undefined;

    constructor() {
        super();
    }

    set objecttype(value: T | undefined) {
        this._objecttype = value;
    }

    get objecttype(): T | undefined {
        return this._objecttype;
    }

}

const person : IPerson = {  name: "Person Stephan",
                            age: 42,
                            formatPerson(): string {
                                return "de persoon " + this.name + " is " + this.age + " oud.";
                            }
};

let logPerson = new App<IPerson>();
logPerson.objecttype = person;

let variable : IPerson[] = [person];
variable.forEach(function (value) {
    console.log(value.formatPerson());
})

function addNumbers(a: number | string , b: number | string) : string{
    if (typeof a == 'number' && typeof b == 'number'){
        return (a + b).toString();
    } else {
        throw new Error('ongeldige waardes ingevoerd');
    }
}

try {
    console.log(addNumbers('test', 20));
} catch (e) {
    console.log('er is iets verkeerd gedaan :' + e.valueOf());
}
