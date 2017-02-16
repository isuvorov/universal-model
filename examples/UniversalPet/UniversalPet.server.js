import UniversalPet from './UniversalPet';
export default class UniversalPetServer extends UniversalPet {
  static avaiableMethods = ['findAll', 'findAll2']
  static async findAll(age) {
    return [
      {
        age: 1,
        name: 'One',
      },
      {
        age: 2,
        name: 'Two',
      },
      {
        age: 3,
        name: 'Three',
      },
    ].filter((pet) => {
      if (!age) return true;
      return pet.age >= age;
    });
  }
  static async findAll2() {
    return [
      {
        age: 1,
        name: 'One',
      },
      {
        age: 2,
        name: 'Two',
      },
      {
        age: 3,
        name: 'Three',
      },
    ];
  }
  static async findAll3() {
    return [
      {
        age: 1,
        name: 'One',
      },
      {
        age: 2,
        name: 'Two',
      },
      {
        age: 3,
        name: 'Three',
      },
    ];
  }
}
