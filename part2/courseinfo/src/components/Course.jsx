const Header = ({ course }) => {
    return <h1>{course.name}</h1>;
};

const Part = ({ part }) => {
    return (
        <p>
            {part.name} {part.exercises}
        </p>
    );
};

const Content = ({ parts }) => {
    return (
        <div>
            {parts.map((part) => (
                <Part key={part.name} part={part} />
            ))}
        </div>
    );
};

const Total = ({ parts }) => {
    return (
        <b>
            toal of {parts.reduce((sum, part) => sum + part.exercises, 0)} exercises
        </b>
    );
};

const Course = ({ courses }) => {
    return (
        <div>
            {courses.map((course) => (
                <div key={course.id}>
                    <Header course={course} />
                    <Content parts={course.parts} />
                    <Total parts={course.parts} />
                </div>
            ))}
        </div>
    );
};

export default Course;
