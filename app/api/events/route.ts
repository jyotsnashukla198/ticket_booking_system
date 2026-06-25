import {prisma} from "@/lib/prisma";

export async function GET(){
    const events = await prisma.event.findMany({
        include:{ shows: {include:{venue:true}}},
        orderBy:{createdAt:"desc"}
    })
    return Response.json(events)
}

export async function POST(request: Request) {
  const { name, description, imageUrl } = await request.json()
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const event = await prisma.event.create({ data: { name, description, imageUrl } })
  return Response.json(event, { status: 201 })
}