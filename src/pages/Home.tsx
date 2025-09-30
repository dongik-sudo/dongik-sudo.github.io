import TextType from "../components/TextType";



export default function Home() {
    return (
        <main className="p-8 text-white flex flex-col justify-center items-center">
            <h1 className="text-2xl text-inherit font-extrabold">
                /
            </h1>
            <div className="
                font-bold text-xl
                mt-8
            ">
                <TextType
                    text = {["Website practice", "This too hard for me"]}
                    typingSpeed = {75}
                    pauseDuration = {1700}
                    deletingSpeed = {60}
                    showCursor = {true}
                    cursorCharacter = "_"
                />
            </div>
            <p className="mt-4 text-inherit">
                This is the index page. No magic, just routes.
            </p>
        </main>
    );
}
