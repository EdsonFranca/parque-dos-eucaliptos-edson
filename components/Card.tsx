type CardProps = {
  title: string;
  desc: string;
  img: string;
};

export default function Card({ title, desc, img }: CardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <img src={img} className="rounded-xl mb-3 h-32 w-full object-cover" />
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}