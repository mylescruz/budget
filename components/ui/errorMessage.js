export default function ErrorMessage({ message }) {
  return (
    <p className="mt-2 text-center text-danger small fw-bold">
      &#9432; {message}
    </p>
  );
}
