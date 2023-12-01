import wand.image
import io

def convert_heic(in_stream):
    out_stream = io.BytesIO()

    with wand.image.Image(file=in_stream) as img:
        img.format = 'jpeg'
        img.save(file=out_stream)

    return out_stream


# test
if __name__ == "__main__":
    import sys

    with open(sys.argv[1], "rb") as input_file:
        output = convert_heic(input_file)
        
    with open(sys.argv[2], "wb") as output_file:
        output_file.write(output.getbuffer())