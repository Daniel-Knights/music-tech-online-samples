<template>
    <div id="tuition" class="page">
        <div class="page-title">
            <h2>1 TO 1 TUITION</h2>
        </div>
        <div class="page-body">
            <div class="page-content">
                <div class="page-content-main">
                    <div class="page-text">
                        <div>
                            <p>
                                MTO offers 1-to-1 online tuition for Logic Pro X & Ableton Live 10,
                                with each hour-long session being personalised to the areas you wish
                                to develop. Whether you are looking to learn music production in
                                your spare time or looking for support along-side your academic
                                studies, MTO provides you with personalised tuition that best fits
                                your learning, as well as your schedule.
                            </p>
                            <p>
                                All new students are provided a free consultation to arrange
                                lessons, determine areas of development and create a unique learning
                                plan.
                            </p>
                        </div>
                        <div class="tuition-side">
                            <img
                                src="../assets/img/zoom-screenshot.png"
                                alt="Zoom One to One Session"
                            />
                            <ul>
                                <li>Free Consultation</li>
                                <li>Personalised Learning Plan</li>
                                <li>£20 per 1 Hour Session</li>
                                <li>£60 for 4 Sessions</li>
                                <li>Learning Resources Provided</li>
                            </ul>
                        </div>
                    </div>
                    <div class="title-background-slant">
                        <h3 class="title-slant-reset">ENQUIRY</h3>
                    </div>
                    <Enquiry />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Enquiry from '../components/Enquiry';

export default {
    name: 'tuition',

    metaInfo() {
        return {
            title: 'Tuition',
        };
    },

    components: { Enquiry },
};
</script>

<style lang="scss">
#tuition .page-content-main {
    flex-direction: column;

    .page-text {
        display: flex;
        align-items: center;
        margin: 20px 150px 50px;

        .tuition-side {
            @include flex-center;
            flex-direction: column;
            position: relative;
            margin-left: 50px;
            transform: translateY(-16px);

            img {
                width: 350px;
                box-shadow: 3px -1px 10px -3px #000;
                opacity: 0;
                animation: tuition-image 1s cubic-bezier(0.01, 0.1, 0.2, 1) forwards,
                    opacity-in 1.5s cubic-bezier(0.5, 0.6, 0.2, 1) forwards;
            }

            ul {
                margin: 0;
                position: absolute;
                padding: 10px 40px;
                transform: translate(-35px, 82px);
                width: 100%;
                min-width: 250px;
                background-color: lighten($black, 10%);
                border: 1px solid rgba($white, 0.8);
                box-shadow: 3px -1px 10px -3px #000;
                list-style-type: square;
                opacity: 0;
                animation: tuition-list 1s 0.5s cubic-bezier(0.01, 0.1, 0.2, 1) forwards,
                    opacity-in 1.5s 0.5s cubic-bezier(0.5, 0.6, 0.2, 1) forwards;

                li {
                    width: max-content;
                    transform: translateX(50px);
                    opacity: 0;
                }

                @for $i from 1 through 5 {
                    > *:nth-of-type(#{$i}) {
                        // Stagger list item animation
                        animation: tuition-list-item
                                1.5s
                                0.5 +
                                $i /
                                5 +
                                s
                                cubic-bezier(0.01, 0.1, 0.2, 1)
                                forwards,
                            opacity-in 1.5s #{0.5 + $i / 5}s cubic-bezier(0.9, 0.6, 0.6, 1) forwards;
                    }
                }
            }

            @keyframes tuition-image {
                0% {
                    transform: translateY(10px);
                }
                100% {
                    transform: translateY(0);
                }
            }
            @keyframes tuition-list {
                0% {
                    transform: translate(-0px, 82px);
                }
                100% {
                    transform: translate(-35px, 82px);
                }
            }
            @keyframes tuition-list-item {
                0% {
                    transform: translateX(50px);
                }
                100% {
                    transform: translateX(0px);
                }
            }
        }
    }

    .legal-guardian-contact {
        position: relative;
        margin-top: 15px;

        h3 {
            margin: auto;
            width: fit-content;
        }

        span {
            cursor: pointer;
            position: absolute;
            left: 0;
            text-decoration: underline;
            transition: color 1s;
            font-size: 16px;

            &:hover {
                color: $primary;
            }
        }
    }

    span {
        font-size: 14px;
    }
}
</style>
