<template>
    <form @submit.prevent="validate()">
        <div class="page-text">
            <div class="title-background-slant">
                <h3 class="title-slant-reset">DETAILS</h3>
            </div>
        </div>
        <div class="form-group" v-if="!underage">
            <label for="ed-name">Name</label>
            <input
                v-model="credentials.name"
                @focus="$hideLabel($event)"
                @blur="$showLabel($event)"
                type="text"
                name="ed-name"
                :class="{
                    'alert-success': credentialsSuccess.name,
                    'alert-danger': credentialsSuccess.name === false,
                }"
            />
        </div>
        <div class="form-group" v-if="!underage">
            <label for="ed-phone">Phone Number (optional)</label>
            <input
                v-model="credentials.phone"
                @focus="$hideLabel($event)"
                @blur="$showLabel($event)"
                type="text"
                name="ed-phone"
                :class="{
                    'alert-success': credentialsSuccess.phone,
                    'alert-danger': credentialsSuccess.phone === false,
                }"
            />
        </div>
        <div class="form-group" v-if="!underage">
            <label for="ed-age">Age</label>
            <input
                v-model.number="credentials.age"
                @focus="$hideLabel($event)"
                @blur="$showLabel($event)"
                @keypress="$isNumber($event)"
                type="number"
                name="ed-age"
                min="1"
                max="124"
                :class="{
                    'alert-success': credentialsSuccess.age,
                    'alert-danger': credentialsSuccess.age === false,
                }"
            />
        </div>
        <div class="form-group" v-if="!underage">
            <label for="ed-gender">Gender (optional)</label>
            <input
                v-model="credentials.gender"
                @focus="$hideLabel($event)"
                @blur="$showLabel($event)"
                type="text"
                name="ed-gender"
            />
        </div>
        <div v-if="underage" class="legal-guardian-signup">
            <h3>Parent or Legal Guardian</h3>
            <div class="form-group">
                <label for="ed-guardian-name">Name</label>
                <input
                    v-model="credentials.guardian.name"
                    @focus="$hideLabel($event)"
                    @blur="$showLabel($event)"
                    type="text"
                    name="ed-guardian-name"
                    :class="{
                        'alert-success': guardianSuccess.name,
                        'alert-danger': guardianSuccess.name === false,
                    }"
                />
            </div>
            <div class="form-group">
                <label for="ed-guardian-phone">Email Address</label>
                <input
                    v-model="credentials.guardian.email"
                    @focus="$hideLabel($event)"
                    @blur="$showLabel($event)"
                    type="text"
                    name="ed-guardian-phone"
                    :class="{
                        'alert-success': guardianSuccess.email,
                        'alert-danger': guardianSuccess.email === false,
                    }"
                />
            </div>
            <div class="form-group">
                <label for="ed-guardian-phone">Phone Number (optional)</label>
                <input
                    v-model="credentials.guardian.phone"
                    @focus="$hideLabel($event)"
                    @blur="$showLabel($event)"
                    type="text"
                    name="ed-guardian-phone"
                />
            </div>
        </div>
        <input type="submit" value="Save" />
    </form>
</template>

<script>
import Axios from 'axios';

import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'Edit',

    data() {
        return {
            credentials: {
                name: '',
                phone: null,
                age: null,
                gender: '',
                guardian: {
                    name: '',
                    email: '',
                    phone: null,
                },
            },
            credentialsSuccess: {
                name: null,
                age: null,
            },
            guardianSuccess: {
                name: null,
                email: null,
            },
            underage: false,
        };
    },

    computed: {
        ...mapGetters(['getUser', 'getToken']),
    },

    methods: {
        ...mapActions(['attempt']),
        validate() {
            const {
                    name,
                    age,
                    guardian: { email: guardianEmail },
                } = this.credentials,
                credentials = this.credentialsSuccess,
                guardian = this.guardianSuccess;

            credentials.name = name ? true : false;
            credentials.age = age ? true : false;

            for (let field in credentials) {
                if (!credentials[field]) return;
            }

            if (age < 18 && this.underage === false) {
                this.$toasted.show('Parental consent required');
                return (this.underage = true);
            }

            guardian.name = this.credentials.guardian.name ? true : false;
            guardian.email = guardianEmail ? true : false;

            if (guardianEmail === this.credentials.email) {
                guardian.email = false;
                return this.$toasted.show('Guardian email must be different');
            }

            if (!guardianEmail.includes('@') || !guardianEmail.includes('.')) {
                guardian.email = false;
                return this.$toasted.show('Invalid guardian email');
            }

            for (let field in guardian) {
                if (!guardian[field] && this.underage) return;
            }

            this.editAccount();
        },
        async editAccount() {
            await Axios.post('/account/edit', this.credentials, {
                params: {
                    method: 'updated',
                    object: 'account',
                },
                headers: { 'x-auth-token': this.getToken },
            })
                .then(res => {
                    this.$toasted.show(res.data.msg);
                    this.attempt();
                    this.$emit('accountUpdated');
                })
                .catch(err => {
                    this.$toasted.show(err.response.data.msg);
                });
        },
        populateFields() {
            for (let field in this.getUser.guardian) {
                if (this.getUser.guardian[field])
                    this.credentials.guardian[field] = this.getUser.guardian[field];
            }
            for (let field in this.getUser) {
                if (!this.credentials[field]) this.credentials[field] = this.getUser[field];
            }
        },
    },

    mounted() {
        this.populateFields();
    },

    updated() {
        const inputs = this.$el.elements;

        // Prevent labels from reappearing
        inputs.forEach(input => {
            if (input.previousSibling.localName !== 'label') return;
            if (input.value !== '') input.previousSibling.style.opacity = '0';
        });
    },
};
</script>
