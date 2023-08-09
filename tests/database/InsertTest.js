import queryBuilder from "./QueryBuilderTest.js";
import {faker} from "@faker-js/faker";

/**
 * creates fake random user with the following fields
 * @returns {{last_name: string, profile_picture: string, about_me: string, password: string, user_id: string, following_count: number, dob: Date, followers_count: number, links_count: number, location: string, first_name: string, email: string, username: string}}
 */
function createRandomUser() {
    return {
        user_id: faker.string.uuid(),
        username: faker.internet.userName(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        profile_picture: faker.internet.avatar(),
        location: `${faker.location.streetAddress()}, ${faker.location.city()} - ${faker.location.country()}`,
        about_me: faker.person.bio(),
        dob: faker.date.birthdate(),
        links_count: faker.number.int(800),
        followers_count: faker.number.int(800),
        following_count: faker.number.int(800),
    };
}

(async () => {
    // generating the fake user data (15 users). you can alter the number the users
    // to be generated with the `count` property
    const usersData = faker.helpers.multiple(createRandomUser, {
        count: 15,
    });

    // generating a single random user
    const userData = createRandomUser();

    // inserting the data (in batch)
    try {
        await queryBuilder.in("users").insertBatch(usersData);
        await queryBuilder.in("users").insert(userData);
    } catch (error) {
        console.error("Error: ", error);
    }
})();
