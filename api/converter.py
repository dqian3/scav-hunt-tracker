import wand.image
import io

# TODO streaming?
def heic_to_jpg(bytes):
    out_stream = io.BytesIO()

    with wand.image.Image(blob=bytes) as img:
        return img.make_blob("jpeg")


# test
if __name__ == "__main__":
    import sys

    with open(sys.argv[1], "rb") as input_file:
        output = heic_to_jpg(input_file.read())
        
    with open(sys.argv[2], "wb") as output_file:
        output_file.write(output)